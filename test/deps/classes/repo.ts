import { EntityRepository } from "../../../src/index";
import { FooModel } from "../../utils/db.utils";

@EntityRepository(FooModel)
export class RepositoryMock {}
