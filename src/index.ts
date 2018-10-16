import 'reflect-metadata'


export { Core } from './core/server'
export { CoreAuth, UserData } from './auth/local/auth.interface'

export * from './auth/local/auth.decorator'

export * from './routing/controllers/controller.decorators'
export * from './routing/controllers/controller.interface'

export * from './services/services.decorator'

export * from './respositories/repository.decorator'

export * from './dependency/dependency.decorators'

export * from './errors/http.error'
export * from './aliases'
