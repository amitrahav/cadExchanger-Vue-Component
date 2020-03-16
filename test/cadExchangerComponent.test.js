import cadExchanger from '../src/cadExchangerComponent.vue'

describe(cadExchanger, () => {
  it('renders', async () => {
    const wrapper = await shallowMount(cadExchanger,{
      propsData: {
        file_url: "String",
        file_name: "String",
        width: 600,
        height: 300,
        autoPlay: false,
        showViewCube: false,
        cameraType: null,
        displayMode: null,
        representation: null,
        frameborder: 1,
        keys_storage: null
      },
    })
    expect(wrapper.isVueInstance()).toBeTruthy()

    expect(wrapper.contains('iframe')).toBe(true)
  })
})