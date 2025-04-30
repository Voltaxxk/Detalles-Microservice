
import 'dotenv/config';
import * as joi from 'joi';


interface EnvvVars {

    PORT : number

}

const envSchema = joi.object({
    PORT: joi.number().required(),
})
.unknown(true)

const {error, value} = envSchema.validate(process.env);

if(error){
    throw new Error(`Config Error: ${error.message}`)
}

const envVars : EnvvVars = value
export const envs = {
    port : envVars.PORT
}