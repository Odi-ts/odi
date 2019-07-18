import { Column, createConnection, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class FooModel {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column()
    public bar: string;
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
        synchronize: true,
        dropSchema: true
    });
});
