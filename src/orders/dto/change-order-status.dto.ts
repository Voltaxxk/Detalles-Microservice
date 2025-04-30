import { IsEnum, IsUUID } from "class-validator";
import { OrderStatusList } from "../enum/order.enum";
import { OrderStatus } from "generated/prisma";



export class ChangeOrderStatusDto {

    @IsUUID()
    id: string;

    @IsEnum(OrderStatusList, {
        message : `Posible Status values are ${OrderStatusList}`
    })
    status: OrderStatus;

}