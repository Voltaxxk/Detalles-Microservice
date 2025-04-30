import { IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive } from "class-validator";
import { OrderStatus } from "generated/prisma";
import { OrderStatusList } from "../enum/order.enum";

export class CreateOrderDto {

    @IsPositive()
    @IsNumber()
    totalAmount: number;

    @IsPositive()
    @IsNumber()
    totalItems : number;
    
    @IsEnum(OrderStatusList, {
        message : `Posible Status values are ${OrderStatusList}`
    })
    @IsOptional()
    status : OrderStatus = OrderStatus.PENDING;

    @IsBoolean()
    @IsOptional()
    paid : boolean  = false;

}
