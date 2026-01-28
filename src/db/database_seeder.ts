// make sure to load env variables
import 'dotenv/config'
/////////////////////////////////////

import { faker } from '@faker-js/faker'
import {
  auditLogs,
  loanProducts,
  loanScheduleStatusEnums,
  loanSchedules,
  loanStatusEnums,
  loans,
  members,
  savingsAccounts,
  savingsProducts,
  transactions,
  users,
} from './schema'
import { db, getDbTableName } from '.'
import { hashPassword } from '@/lib/utils'
import { InferSelectModel } from 'drizzle-orm'

type UserEntity = InferSelectModel<typeof users>
type LoanEntity = InferSelectModel<typeof loans>
type MemberEntity = InferSelectModel<typeof members>
type AuditLogEntity = InferSelectModel<typeof auditLogs>
type LoanRepaymentEntity = InferSelectModel<typeof loanSchedules>
type TransactionEntity = InferSelectModel<typeof transactions>
type SavingAccountEntity = InferSelectModel<typeof savingsAccounts>
type SavingProductEntity = InferSelectModel<typeof savingsProducts>
type LoanProductEntity = InferSelectModel<typeof loanProducts>

const testUserPassword = 'Password2'

const testMemberPassword = 'Password2!'

const testAdminAccount = {
  email: 'admin@sacco.com',
  firstName: 'Muhammed',
  lastName: 'Kasujja',
}

/// Row counts for test data per table
const USERS_COUNT = 5
const MEMBERS_COUNT = 5
const LOANS_COUNT = 10
const LOAN_REPAYMENTS_COUNT = 52
const SAVING_ACCOUNTS_COUNT = 5
const SAVING_PRODUCTS_COUNT = 5
const LOAN_TRANSACTIONS_COUNT = 140
const SAVING_TRANSACTIONS_COUNT = 100
const AUDIT_LOGS_COUNT = 5_0

const LOAN_PRODUCTS = [
  'Personal Loan',
  'Business Loan',
  'Agricultural Loan',
  'Emergency Loan',
  'Medical Loan',
]

export class DatabaseSeeder {
  private mockUsers: UserEntity[] = []
  private mockMembers: MemberEntity[] = []
  private mockLoans: LoanEntity[] = []
  private mockLoanProducts: LoanProductEntity[] = []
  private mockLoanRepayments: LoanRepaymentEntity[] = []
  private mockSavingAccounts: SavingAccountEntity[] = []
  private mockSavingProducts: SavingProductEntity[] = []
  private mockLoanTransactions: TransactionEntity[] = []
  private mockSavingTransactions: TransactionEntity[] = []

  private async createDefaultAdminAccount() {
    const password = await hashPassword(testUserPassword)
    await db
      .insert(users)
      .values({
        firstName: testAdminAccount.firstName,
        lastName: testAdminAccount.lastName,
        email: testAdminAccount.email,
        password: password, // In real app: hash this!
        createdAt: faker.date.recent({ days: 100 }),
      })
      .returning()
  }

  private async generateUsers() {
    for (let i = 0; i < USERS_COUNT; i++) {
      const firstName = faker.person.firstName()
      const email = faker.internet.email({
        firstName: firstName.toLowerCase(),
      })

      const password = await hashPassword(testUserPassword)

      const [user] = await db
        .insert(users)
        .values({
          firstName,
          lastName: faker.person.lastName(),
          email,
          password: password, // In real app: hash this!
          createdAt: faker.date.recent({ days: 100 }),
        })
        .returning()

      this.mockUsers.push(user)
    }
    console.log(`👥 Created ${USERS_COUNT} users`)
    return USERS_COUNT
  }

  private async generateLoans() {
    // Generate fake loans for random members
    for (let i = 0; i < LOANS_COUNT; i++) {
      const member: MemberEntity = faker.helpers.arrayElement(this.mockMembers)
      const loanProduct: LoanProductEntity = faker.helpers.arrayElement(
        this.mockLoanProducts,
      )
      let approvedById = null
      if (i % 3 === 0) {
        const approver: UserEntity = faker.helpers.arrayElement(this.mockUsers)
        approvedById = approver.id
      }
      const newloan = await db
        .insert(loans)
        .values({
          loanProductId: loanProduct.id,
          memberId: member.id,
          number: faker.string.uuid(),
          approvedBy: approvedById,
          interestRate: faker.finance.amount({ min: 5, max: 45, dec: 2 }),
          installmentCount: faker.finance.amount({ min: 5, max: 60, dec: 0 }),
          principalAmount: faker.finance.amount({
            min: 5_000,
            max: 500_000,
            dec: 2,
          }),
          status: faker.helpers.arrayElement(loanStatusEnums.enumValues),
          createdAt: faker.date.recent({ days: 90 }),
          // Add more fields as needed
        })
        .returning()

      this.mockLoans.push(newloan[0])
    }
    return this.mockLoans
  }

  private async generateMembers() {
    // Generate fake members
    for (let i = 0; i < MEMBERS_COUNT; i++) {
      const firstName = faker.person.firstName()
      const email = faker.internet.email({ firstName })
      const password = await hashPassword(testMemberPassword)

      const newMember = await db
        .insert(members)
        .values({
          idNumber: faker.string.uuid(),
          firstName: firstName,
          lastName: faker.person.lastName(),
          email: email,
          password: password,
          phone: faker.phone.number({ style: 'international' }),
          joinDate: faker.date.past().toISOString(),
          address: faker.location.streetAddress(),
          status: faker.helpers.arrayElement([
            'active',
            'pending',
            'rejected',
            'inactive',
          ]),
          createdAt: faker.date.recent({ days: 1000 }),
        })
        .returning()

      this.mockMembers.push(newMember[0])
    }
    console.log(`👥 Created ${this.mockMembers.length} members`)
    return this.mockMembers
  }

  private async generateLoanTransactions() {
    // Generate fake loan transactions
    for (let i = 0; i < LOAN_TRANSACTIONS_COUNT; i++) {
      const member: MemberEntity = faker.helpers.arrayElement(this.mockMembers)
      const loan: LoanEntity = faker.helpers.arrayElement(this.mockLoans)
      const newTransaction = await db
        .insert(transactions)
        .values({
          loanId: loan.id,
          memberId: member.id,
          date: faker.date.past().toISOString(),
          transactionType: faker.finance.transactionType(),
          description: faker.finance.transactionDescription(),
          amount: faker.finance.amount({ min: 5000, max: 500000, dec: 2 }),
          createdAt: faker.date.recent({ days: 500 }),
        })
        .returning()

      this.mockLoanTransactions.push(newTransaction[0])
    }
    console.log(`👥 Created ${LOAN_TRANSACTIONS_COUNT} transactions`)
    return LOAN_TRANSACTIONS_COUNT
  }

  private async generateSavingTransactions() {
    // Generate fake saving transactions
    for (let i = 0; i < SAVING_TRANSACTIONS_COUNT; i++) {
      const member: MemberEntity = faker.helpers.arrayElement(this.mockMembers)
      const account: SavingAccountEntity = faker.helpers.arrayElement(
        this.mockSavingAccounts,
      )
      const newTransaction = await db
        .insert(transactions)
        .values({
          accountId: account.id,
          memberId: member.id,
          date: faker.date.past().toISOString(),
          transactionType: faker.finance.transactionType(),
          description: faker.finance.transactionDescription(),
          amount: faker.finance.amount({ min: 10_000, max: 200_000, dec: 2 }),
          createdAt: faker.date.recent({ days: 500 }),
        })
        .returning()

      this.mockSavingTransactions.push(newTransaction[0])
    }
    console.log(
      `👥 Created ${this.mockSavingTransactions.length} saving transactions`,
    )
    return this.mockSavingTransactions
  }

  private async generateSavingProducts() {
    for (let i = 0; i < SAVING_PRODUCTS_COUNT; i++) {
      const newTransaction = await db
        .insert(savingsProducts)
        .values({
          productName: faker.finance.accountName(),
          description: faker.finance.transactionDescription(),
          interestRate: faker.finance.amount({ min: 2, max: 20, dec: 2 }),
          minimumBalance: faker.finance.amount({
            min: 10_000,
            max: 1_000_000,
            dec: 2,
          }),
          createdAt: faker.date.recent({ days: 600 }),
        })
        .returning()

      this.mockSavingProducts.push(newTransaction[0])
    }
    console.log(`👥 Created ${SAVING_PRODUCTS_COUNT} saving products`)
    return SAVING_PRODUCTS_COUNT
  }

  private async generateSavingAccounts() {
    for (let i = 0; i < SAVING_ACCOUNTS_COUNT; i++) {
      const member: MemberEntity = faker.helpers.arrayElement(this.mockMembers)
      const product: SavingProductEntity = faker.helpers.arrayElement(
        this.mockSavingProducts,
      )
      const newAccount = await db
        .insert(savingsAccounts)
        .values({
          memberId: member.id,
          productId: product.id,
          accountNumber: faker.finance.accountNumber(),
          openedDate: faker.date.past().toISOString(),
          balance: faker.finance.amount({
            min: 10_000,
            max: 1_000_000,
            dec: 2,
          }),
          createdAt: faker.date.recent({ days: 1000 }),
        })
        .returning()

      this.mockSavingAccounts.push(newAccount[0])
    }
    console.log(`👥 Created ${this.mockSavingAccounts.length} saving account`)
    return this.mockSavingAccounts
  }

  private async generateLoanProducts() {
    for (let product of LOAN_PRODUCTS) {
      const newProduct = await db
        .insert(loanProducts)
        .values({
          productName: product,
          description: faker.finance.transactionDescription(),
          repaymentPeriodMonths: faker.number.int({ min: 3, max: 36 }),
          interestRate: faker.finance.amount({ min: 2, max: 20, dec: 2 }),
          minAmount: faker.finance.amount({
            min: 10_000,
            max: 50_000,
            dec: 2,
          }),
          maxAmount: faker.finance.amount({
            min: 100_000,
            max: 1_000_000,
            dec: 2,
          }),
          createdAt: faker.date.recent({ days: 90 }),
        })
        .returning()

      this.mockLoanProducts.push(newProduct[0])
    }
    console.log(`👥 Created ${LOAN_PRODUCTS.length} loan products`)
    return LOAN_PRODUCTS.length
  }

  private async generateLoanRepayments() {
    for (let i = 0; i < LOAN_REPAYMENTS_COUNT; i++) {
      const loan: LoanEntity = faker.helpers.arrayElement(this.mockLoans)
      const amount = faker.finance.amount({
        min: 100_000,
        max: 1_000_000,
        dec: 2,
      })
      const repayment = await db
        .insert(loanSchedules)
        .values({
          loanId: loan.id,
          repaymentDate: faker.date.past().toISOString(),
          totalAmountPaid: '0',
          amount: amount,
          interestPaid: faker.finance.amount({
            min: 10,
            max: 20,
            dec: 0,
          }),
          balanceAfter: amount,
          status: faker.helpers.arrayElement(
            loanScheduleStatusEnums.enumValues,
          ),
          createdAt: faker.date.recent({ days: 500 }),
        })
        .returning()

      this.mockLoanRepayments.push(repayment[0])
    }
    console.log(`👥 Created ${LOAN_REPAYMENTS_COUNT} loan repayments`)
    return LOAN_REPAYMENTS_COUNT
  }

  private async generateAuditLogs() {
    const logs: AuditLogEntity[] = []
    for (let i = 0; i < AUDIT_LOGS_COUNT; i++) {
      const user: UserEntity = faker.helpers.arrayElement(this.mockUsers)
      const record = faker.helpers.arrayElement(this.mockLoanTransactions)
      const newLog = await db
        .insert(auditLogs)
        .values({
          entityId: record.id,
          changedBy: user.id,
          entityType: faker.helpers.arrayElement([
            getDbTableName(transactions),
            getDbTableName(loanSchedules),
            getDbTableName(loans),
            getDbTableName(members),
            getDbTableName(savingsProducts),
            getDbTableName(savingsAccounts),
            getDbTableName(loanProducts),
          ]),
          eventType: faker.helpers.arrayElement(['I', 'U', 'D']),
          createdAt: faker.date.recent({ days: 1000 }),
        })
        .returning()

      logs.push(newLog[0])
    }
    console.log(`👥 Created ${AUDIT_LOGS_COUNT} audit logs`)
    return AUDIT_LOGS_COUNT
  }

  private async cleanDb() {
    try {
      // console.log('Current Env:', process.env)
      // const result = await db.execute(sql`SELECT current_database()`)
      // console.log('Connected to database:', result.rows)

      /// clear data base
      await db.delete(loans)
      await db.delete(loanProducts)
      await db.delete(loanSchedules)
      await db.delete(savingsAccounts)
      await db.delete(savingsProducts)
      await db.delete(auditLogs)
      await db.delete(transactions)
      await db.delete(users)
      await db.delete(members)

      console.log('🗑️  Cleared existing data')
    } catch (error) {
      console.warn('⚠️  Some tables might not exist yet — continuing', error)
    }
  }

  private async build({
    includeTestData = false,
  }: {
    includeTestData?: boolean
  }) {
    await this.createDefaultAdminAccount()
    await this.generateUsers()
    await this.generateLoanProducts()
    await this.generateSavingProducts()
    if (!includeTestData) return
    await this.generateMembers()
    await this.generateSavingAccounts()
    await this.generateLoans()
    await this.generateLoanRepayments()
    await this.generateLoanTransactions()
    await this.generateSavingTransactions()
    await this.generateAuditLogs()
  }

  async seed({ includeTestData = false }: { includeTestData?: boolean }) {
    await this.cleanDb()

    await this.build({ includeTestData })
  }
}
