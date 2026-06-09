const app = require('./app')
const { PORT } = require('../../consts')

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`)
})
