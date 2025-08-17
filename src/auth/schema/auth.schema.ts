import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuthDocument = HydratedDocument<Auth>

@Schema({versionKey: 'version',timestamps: true})
export class Auth {

    @Prop({required: true})
    email : string

    @Prop({required: true})
    password: string

}

export const AuthSchema = SchemaFactory.createForClass(Auth)