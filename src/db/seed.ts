// make sure to load env variables
import 'dotenv/config'
/////////////////////////////////////
import { DatabaseSeeder } from './database_seeder'
import { db } from '.'

const main = async () => {
  console.log('\n\nSeeding data ...')

  await new DatabaseSeeder().seed({ includeTestData: false })

  console.log('*** Seeding successfully ***\n')
}

main().finally(async () => {
  // imediately terminate the connection after seeding data
  await db.$client.end()
})
