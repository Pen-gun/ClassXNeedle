import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT

app.get('/api', (req, res) => {
  res.send('Hello World!')

})
app.get('/api/about', (req, res) => {
  res.send('This is the about page.')
})
app.get('/api/contact', (req, res) => {
  const contactInfo = [{
    id: 1,
    email: 'contact@example.com',
    phone: '123-456-7890',
    address: '123 Main St, Anytown, USA'
  },
  {
    id: 2,
    email: 'support@example.com',
    phone: '987-654-3210',
    address: '456 Another St, Sometown, USA'
  },
  {
    id: 3,
    email: 'info@example.com',
    phone: '555-555-5555',
    address: '789 Different St, Othertown, USA'
  },
  {
    id: 4,
    email: 'help@example.com',
    phone: '444-444-4444',
    address: '101 Last St, Finaltown, USA'
  }
  ];
  res.json(contactInfo);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})