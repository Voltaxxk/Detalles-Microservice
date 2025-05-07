import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from 'generated/prisma';
import { ClientProxy, MessagePattern, RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatusDto } from './dto';
import { NATS_SERVICE, PRODUCTS_SERVICE } from 'src/common/config';
import { firstValueFrom } from 'rxjs';
import { OrderWithProducts } from './interfaces/order-with-products.interface';
import { PaidOrderDto } from './dto/paid-order.dto';





@Injectable()
export class OrdersService extends PrismaClient  implements OnModuleInit   {
  
  constructor(
    @Inject(NATS_SERVICE) private readonly natsClient : ClientProxy
  ) {
    super();
  }

  private readonly logger = new Logger('OrdersService');


  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async create(createOrderDto: CreateOrderDto) {

    try {

        const productIds = createOrderDto.items.map(item => item.productId)

        // console.log(productIds)

        const products =  await firstValueFrom(
            this.natsClient.send({cmd : 'validate_products'}, productIds)
          )
        
        // console.log(products)
          

        const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {

          const price = products.find(product => product.id === orderItem.productId).price;

          return price * orderItem.quantity ;

        },0)

        const totalItems = createOrderDto.items.reduce((acc, orderItem) => {
          return acc + orderItem.quantity;
        },0)


        //3. Crear una transaccion de BD

        const order = await this.order.create({
          data : {
            totalAmount,
            totalItems,
            OrderItem : {
              createMany : {
                data : createOrderDto.items.map( orderItem => ({
                  price : products.find(product => product.id === orderItem.productId).price,
                  productId: orderItem.productId,
                  quantity : orderItem.quantity
                }))
              }
            }
          },
          include : {
            OrderItem : {
              select : {
                productId : true,
                quantity : true,
                price : true
              }
            }
          }
        })



      return {
        ...order,
        OrderItem : order.OrderItem.map( (orderItem) => ({
          ...orderItem,
          product : products.find(product => product.id === orderItem.productId).name
        }))
      }
      
    } catch (error) {
      throw new RpcException({
        status : HttpStatus.BAD_REQUEST,
        message : 'Check Logs'
      })
    }


  }

  async findAll(orderPaginationDto : OrderPaginationDto) {

    const { page, limit, status } = orderPaginationDto;

    const totalPages = await this.order.count({
      where : {status}
    });
    const lastPage = Math.ceil(totalPages / limit!);

    return {
      
      data : await this.order.findMany({
        where : {status},
        skip : (page! - 1) * limit!,
        take : limit,
      }),
      meta : {
        totalPages,
        page,
        lastPage
      }
    } 
  }

  async findOne(id: string) {

    const findOrder = await this.order.findFirst({
      where: { id}, 
    });

    // const findOrder = await this.order.findFirst({
    //   where: { id}, 
    //   include : {
    //     OrderItem : {
    //       select : {
    //         price : true,
    //         quantity : true,
    //     }
    //   }
    // });

    if(!findOrder) {
      throw new RpcException({
        message : `Order with id ${id} not found`,
        status : HttpStatus.BAD_REQUEST
      })
    }

    const productIds = await this.orderItem.findMany({
      where : {
        orderId : id
      },
      select : {
        productId : true,
      }
    })

    const productsId = productIds.map(product => product.productId).sort()

    const products =  await firstValueFrom(
      this.natsClient.send({cmd : 'validate_products'}, productsId)
    )
  
    console.log(products)

    // return findOrder
    return {
      ...findOrder,
      items : products
    }

  }

  // update(id: number, updateOrderDto: UpdateOrderDto) {
  //   return `This action updates a #${id} order`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} order`;
  // }


  async changeOrderSatus(changeOrderStatusDto : ChangeOrderStatusDto) {

    const {id, status} = changeOrderStatusDto

    const order = await this.findOne(id);


    if(order.status === status) return order

    return this.order.update({
      where : {id},
      data : {status}
    })

    // return changeOrderStatusDto
    // return `This action changes a #${id} order status to ${status}`;
  }


  async createPaymentSession(order : OrderWithProducts) {

    const paymentSession = await firstValueFrom(
        this.natsClient.send('create.payment.session', {
          orderId : order.id,
          currency : 'usd',
          
          items : order.OrderItem.map(item => {


            console.log({item})
            return {
              name : item.product,
              price : item.price,
              quantity : item.quantity
            }
          })
      })
    )

    return paymentSession

  }

  async paidOrder(paidOrderDto : PaidOrderDto){

    this.logger.log('Paid Order')
    this.logger.log({paidOrderDto})

    const updatedorder = await this.order.update({
      where : {id : paidOrderDto.orderId},
      data : {
        status : 'PAID',
        paid : true,
        paidAt : new Date(),
        stripeChargeId : paidOrderDto.stripePaymentId,

        // Relation
        OrderReceipt : {
          create : {
            receiptUrl : paidOrderDto.receiptUrl
          }
        }
      }
    })

    return {...updatedorder}

  }

}
