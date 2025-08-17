import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>

@Schema({versionKey: 'version',timestamps: true})
export class User {

    @Prop({required: true})
    name : string

    @Prop({required: true})
    age: number


    @Prop([String])
    tags: string[]

    //     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' })
    // owner: Owner;


}

export const UserSchema = SchemaFactory.createForClass(User)