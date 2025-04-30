import { PartialType } from "@nestjs/mapped-types";

import { IsEnum, IsOptional } from "class-validator";
import { OrderStatus } from "generated/prisma";
import { PaginationDto } from "src/common";
import {  OrderStatusList } from "src/orders/enum/order.enum";


export class OrderPaginationDto extends PaginationDto {


    @IsEnum(OrderStatusList, {
        message : `Posible Status values are ${OrderStatusList}`
    })
    @IsOptional()
    status? : OrderStatus;

}
