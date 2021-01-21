import rootResolver from './rootResolver'

describe('rootResolver', () => {
  it('should return "Hello World"', () => {
    const res = rootResolver.Query.hello()
    expect(res).toEqual('Hello World')
  })
})
