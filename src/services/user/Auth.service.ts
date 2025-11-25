import type {
  createCustomerInputs,
  createvendorInputs,
  loginInputs,
  userType,
} from "../../dto/index.ts";
 



//work in progress to make the code as much as reusable and sharable as possible


type createInputs = createvendorInputs | createCustomerInputs;
export class Auth {
  public static createAccount(data: createInputs, userType: userType) {}
  public static login(data: loginInputs, userType: userType) {}  
  public static forgotPassword(oldPassword:string, newPassword:string,userType:userType){
  }
}
