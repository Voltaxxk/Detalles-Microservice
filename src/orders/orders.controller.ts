import { Controller, NotImplementedException, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { ChangeOrderStatusDto, CreateOrderDto } from './dto';
import { OrderStatusList } from './enum/order.enum';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { PaidOrderDto } from './dto/paid-order.dto';

OrderStatusList
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('createOrder')
  async create(@Payload() createOrderDto: CreateOrderDto) {

    const order = await this.ordersService.create(createOrderDto);
    const paymentSession = await this.ordersService.createPaymentSession(order);

    return {
      order,
      paymentSession
    }
  }

  @MessagePattern('findAllOrders')
  findAll(
    @Payload() orderPaginationDto : OrderPaginationDto

  ) {
    return this.ordersService.findAll(orderPaginationDto);
  }

  @MessagePattern('findOneOrder')
  findOne(@Payload('id' , ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  // @MessagePattern('updateOrder')
  // update(@Payload() updateOrderDto: UpdateOrderDto) {
  //   return this.ordersService.update(updateOrderDto.id, updateOrderDto);
  // }

  // @MessagePattern('removeOrder')
  // remove(@Payload() id: number) {
  //   return this.ordersService.remove(id);
  // }

  @MessagePattern('changeOrderSatus')
  changeOrderSatus(@Payload() changeOrderStatusDto : ChangeOrderStatusDto) {
    return this.ordersService.changeOrderSatus(changeOrderStatusDto);
    // throw new NotImplementedException();
  }

  @EventPattern('payment.succeeded')
  paidOrder(@Payload() paidOrderDto : PaidOrderDto){
    return this.ordersService.paidOrder(paidOrderDto);
  }
}
