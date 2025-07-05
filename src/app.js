import { Header } from '@components/Header.js'
import { FormSection } from '@components/FormSection.js'
import { Tips } from '@components/Tips.js'

class CarbonFootprintCalculator {
  constructor() {
    this.initApp()
  }

  initApp() {
    const app = document.getElementById('app')
    if (app) {
      app.innerHTML = `
        ${Header()}
        <div class="container">
          ${new FormSection().render()}
          ${Tips()}
        </div>
      `
    }
  }
}

new CarbonFootprintCalculator()