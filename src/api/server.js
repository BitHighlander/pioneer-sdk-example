/* eslint-disable no-unused-vars */

import { Server, Model, Factory, hasMany, RestSerializer } from 'miragejs'


const IdSerializer = RestSerializer.extend({
  serializeIds: 'always',
})



const generateTodoText = () => {
  const text = "fuckoff"
  return text
}

new Server({
  routes() {
    this.namespace = 'fakeApi'
    this.timing = 2000

    this.resource('todos')
    this.resource('lists')

    const server = this

    this.post('/todos', function (schema, req) {
      const data = this.normalizedRequestAttrs()

      if (data.text === 'error') {
        throw new Error('Could not save the todo!')
      }

      const result = server.create('todo', data)
      return result
    })
  },
  models: {
    todo: Model.extend({}),
    list: Model.extend({
      todos: hasMany(),
    }),
  },
  factories: {
    todo: Factory.extend({
      id(i) {
        return Number(i)
      },
      text() {
        return generateTodoText()
      },
      completed() {
        return false
      },
      color() {
        return ''
      },
    }),
  },
  serializers: {
    todo: IdSerializer.extend({
      serialize(object, request) {
        // HACK Mirage keeps wanting to store integer IDs as strings. Always convert them to numbers for now.
        const numerifyId = (todo) => {
          todo.id = Number(todo.id)
        }
        let json = IdSerializer.prototype.serialize.apply(this, arguments)

        if (json.todo) {
          numerifyId(json.todo)
        } else if (json.todos) {
          json.todos.forEach(numerifyId)
        }

        return json
      },
    }),
    list: IdSerializer,
  },
  seeds(server) {
    server.createList('todo', 5)
  },
})
