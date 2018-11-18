import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class FooModel {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    bar: string;
}