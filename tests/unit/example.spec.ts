import { mount } from '@vue/test-utils'
import HomePage from '@/views/HomePage.vue'

describe('HomePage.vue', () => {
  it('renders home view', () => {
    const wrapper = mount(HomePage)
    expect(wrapper.text()).toMatch('Dansguiden - Hitta din dans')
    expect(wrapper.text()).toMatch('Välj datum')
    expect(wrapper.text()).toMatch('Välj län')
    expect(wrapper.text()).toMatch('Välj plats')
  })
})
