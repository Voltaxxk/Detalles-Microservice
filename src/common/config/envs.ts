
import 'dotenv/config';
import * as joi from 'joi';


interface EnvvVars {

    PORT : number
    // PRODUCTS_MICROSERVICE_HOST : string
    // PRODUCTS_MICROSERVICE_PORT : number
    NATS_SERVERS : string[]
}

const envSchema = joi.object({
    PORT: joi.number().required(),
    // PRODUCTS_MICROSERVICE_HOST : joi.string().required(),
    // PRODUCTS_MICROSERVICE_PORT : joi.number().required(),
    NATS_SERVERS : joi.array().items(joi.string()).required()
})
.unknown(true)

const {error, value} = envSchema.validate({
    ...process.env,
    NATS_SERVERS : process.env?.NATS_SERVERS?.split(',')
});

if(error){
    throw new Error(`Config Error: ${error.message}`)
}

const envVars : EnvvVars = value
export const envs = {
    port : envVars.PORT,
    // productServiceHost : envVars.PRODUCTS_MICROSERVICE_HOST,
    // productServicePort : envVars.PRODUCTS_MICROSERVICE_PORT,
    natsServers : envVars.NATS_SERVERS
}
