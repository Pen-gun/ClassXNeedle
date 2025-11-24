import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT

app.get('/', (req, res) => {
  res.send('Hello World!')
  
})
app.get('/about', (req, res) => {
  res.send('This is the about page.')
})
app.get('/contact', (req, res) => {
  res.send('This is the contact page.')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})