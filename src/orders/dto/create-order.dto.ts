import { ArrayMinSize, IsArray,ValidateNested } from "class-validator";

import { Type } from "class-transformer";
import { OrderItemDto } from "./order-item.dto";

export class CreateOrderDto {

    // @IsPositive()
    // @IsNumber()
    // totalAmount: number;

    // @IsPositive()
    // @IsNumber()
    // totalItems : number;
    
    // @IsEnum(OrderStatusList, {
    //     message : `Posible Status values are ${OrderStatusList}`
    // })
    // @IsOptional()
    // status : OrderStatus = OrderStatus.PENDING;

    // @IsBoolean()
    // @IsOptional()
    // paid : boolean  = false;


    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({
        each: true
    })
    @Type(() => OrderItemDto)
    items : OrderItemDto[];

}
