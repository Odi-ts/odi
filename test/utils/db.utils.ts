import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { createConnection } from "typeorm";

@Entity()
export class FooModel {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    bar: string;
}


before(async () => {
    await createConnection({
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "postgres",
        password: "",
        database: "test_db",
        entities: [ FooModel ],
        synchronize: true
    });
});