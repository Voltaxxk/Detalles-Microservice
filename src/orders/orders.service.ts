import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from 'generated/prisma';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatusDto } from './dto';





@Injectable()
export class OrdersService extends PrismaClient  implements OnModuleInit   {

  private readonly logger = new Logger('OrdersService');


  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  create(createOrderDto: CreateOrderDto) {
    return this.order.create({
      data : createOrderDto
    })
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
      where: { id}
    });

    if(!findOrder) {
      throw new RpcException({
        message : `Order with id ${id} not found`,
        status : HttpStatus.BAD_REQUEST
      })
    }

    return findOrder;
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
}
