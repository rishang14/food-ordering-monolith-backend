//here order will be created and send to the queue      

import { Customercart } from "./Cart.service.ts";


export interface foodItems{
    _id:string,
    unit:number, 
}

export interface orderDetails{
  foods:foodItems[], 
  restaurantId:string, 
  userId:string  
}


export class CustomerOrder extends Customercart{

}