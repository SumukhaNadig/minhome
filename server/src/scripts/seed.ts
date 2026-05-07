import mongoose from 'mongoose'
import { connectMongo, disconnectMongo } from '../db'
import { Transaction } from '../models/Transaction'
import { SourceOfTruth } from '../models/SourceOfTruth'
import { TaskDefinition } from '../models/TaskDefinition'
import { AuditLogEntry } from '../models/AuditLogEntry'
import { TaskExecution } from '../models/TaskExecution'
import { EmailLog } from '../models/EmailLog'
import { Note } from '../models/Note'

const daysFromNow = (d: number) => {
  const x = new Date()
  x.setDate(x.getDate() + d)
  return x
}

async function clear() {
  await Promise.all([
    Transaction.deleteMany({}),
    SourceOfTruth.deleteMany({}),
    TaskDefinition.deleteMany({}),
    AuditLogEntry.deleteMany({}),
    TaskExecution.deleteMany({}),
    EmailLog.deleteMany({}),
    Note.deleteMany({}),
  ])
}

async function seedTransactions() {
  const definitions = [
    { address: '142 Cherry Lane, Austin TX', status: 'active', fields: { propertyAddress: '142 Cherry Lane, Austin TX', purchasePrice: 875000, closingDate: daysFromNow(45), buyerName: 'Patel Family', sellerName: 'Lopez Family', agentName: 'Marisol Vega', agentEmail: 'marisol.vega@homefinder.test', inspectionStatus: 'scheduled', financingType: 'conventional', earnestMoneyAmount: 25000, titleCompany: 'Lone Star Title' } },
    { address: '88 Beachview Dr, Santa Cruz CA', status: 'active', fields: { propertyAddress: '88 Beachview Dr, Santa Cruz CA', purchasePrice: 2400000, closingDate: daysFromNow(28), buyerName: 'A. Chen', sellerName: 'P. Murphy', agentName: 'Devon Park', agentEmail: 'devon.park@coastalrealty.test', inspectionStatus: 'pending', financingType: 'cash', earnestMoneyAmount: 200000, titleCompany: 'Coastal Title Co' } },
    { address: '512 Maple Ave, Denver CO', status: 'active', fields: { propertyAddress: '512 Maple Ave, Denver CO', purchasePrice: 645000, closingDate: daysFromNow(60), buyerName: 'J. Reyes', sellerName: 'M. Klein', agentName: 'Bailey Tran', agentEmail: 'bailey.tran@rockyrealty.test', inspectionStatus: 'complete', financingType: 'fha', earnestMoneyAmount: 15000, titleCompany: 'Mile High Title' } },
    { address: '7 Riverbend Ct, Portland OR', status: 'active', fields: { propertyAddress: '7 Riverbend Ct, Portland OR', purchasePrice: 1100000, closingDate: daysFromNow(75), buyerName: 'Karim Bros', sellerName: 'A. Schultz', agentName: 'Sloane Park', agentEmail: 'sloane.park@bridgetown.test', inspectionStatus: 'scheduled', financingType: 'conventional', earnestMoneyAmount: 40000, titleCompany: 'Stumptown Title' } },
    { address: '900 Sunset Blvd, Los Angeles CA', status: 'closed', fields: { propertyAddress: '900 Sunset Blvd, Los Angeles CA', purchasePrice: 3200000, closingDate: daysFromNow(-21), buyerName: 'Hollywood LLC', sellerName: 'Sunset Trust', agentName: 'Rae Holloway', agentEmail: 'rae@hwoodrealty.test', inspectionStatus: 'complete', financingType: 'cash', earnestMoneyAmount: 300000, titleCompany: 'Pacific Title' } },
    { address: '23 Birch St, Burlington VT', status: 'closed', fields: { propertyAddress: '23 Birch St, Burlington VT', purchasePrice: 410000, closingDate: daysFromNow(-90), buyerName: 'M. Caron', sellerName: 'D. Berlin', agentName: 'Alex Lake', agentEmail: 'alex@greenmtn.test', inspectionStatus: 'complete', financingType: 'va', earnestMoneyAmount: 8000, titleCompany: 'Green Mountain Title' } },
    { address: '301 Pine Trail, Asheville NC', status: 'active', fields: { propertyAddress: '301 Pine Trail, Asheville NC', purchasePrice: 580000, closingDate: daysFromNow(7), buyerName: 'F. Yamato', sellerName: 'L. Ross', agentName: 'Camille Boyd', agentEmail: 'camille.boyd@blueridge.test', inspectionStatus: 'pending', financingType: 'conventional', earnestMoneyAmount: 18000 } },
    { address: '14 Echo Way, Boise ID', status: 'active', fields: {} },
  ]

  for (const def of definitions) {
    const txn = await Transaction.create({ address: def.address, status: def.status as any })
    await SourceOfTruth.create({ transactionId: txn._id, fields: def.fields })
  }
}

async function seedTaskDefinitions() {
  await TaskDefinition.create([
    {
      name: 'High-value flag',
      description: 'Flag transactions over $1M for review.',
      watchedKeys: ['purchasePrice'],
      predicates: [{ key: 'purchasePrice', op: 'gte', value: 1000000 }],
      actions: [{ type: 'setFlag', config: { flagName: 'highValue', value: true } }],
      enabled: true,
    },
    {
      name: 'High-value email',
      description: 'Notify the agent on a high-value transaction.',
      watchedKeys: ['purchasePrice', 'agentEmail'],
      predicates: [
        { key: 'purchasePrice', op: 'gte', value: 1000000 },
        { key: 'agentEmail', op: 'exists' },
      ],
      actions: [
        {
          type: 'sendEmail',
          config: {
            to: '{{agentEmail}}',
            subject: 'High-value transaction: {{propertyAddress}}',
            body: 'Heads up — purchase price is now {{purchasePrice}}. Please confirm financing details.',
          },
        },
      ],
      enabled: true,
    },
    {
      name: 'Inspection reminder',
      description: 'Add a note when inspection is incomplete and closing is set.',
      watchedKeys: ['inspectionStatus', 'closingDate'],
      predicates: [
        { key: 'inspectionStatus', op: 'ne', value: 'complete' },
        { key: 'closingDate', op: 'exists' },
      ],
      actions: [
        {
          type: 'createNote',
          config: { body: 'Inspection still pending; closing date {{closingDate}}.' },
        },
      ],
      enabled: true,
    },
    {
      name: 'Cash deal flag',
      description: 'Flag cash deals.',
      watchedKeys: ['financingType'],
      predicates: [{ key: 'financingType', op: 'eq', value: 'cash' }],
      actions: [{ type: 'setFlag', config: { flagName: 'cashDeal', value: true } }],
      enabled: true,
    },
    {
      name: 'Title company missing',
      description: 'Create a note when title company is missing close to closing.',
      watchedKeys: ['titleCompany', 'closingDate'],
      predicates: [
        { key: 'closingDate', op: 'exists' },
        { key: 'titleCompany', op: 'notExists' },
      ],
      actions: [{ type: 'createNote', config: { body: 'Title company not yet selected.' } }],
      enabled: true,
    },
  ])
}

async function main() {
  await connectMongo()
  // eslint-disable-next-line no-console
  console.log('Clearing collections...')
  await clear()
  // eslint-disable-next-line no-console
  console.log('Seeding transactions...')
  await seedTransactions()
  // eslint-disable-next-line no-console
  console.log('Seeding task definitions...')
  await seedTaskDefinitions()
  // eslint-disable-next-line no-console
  console.log('Done.')
  await disconnectMongo()
  await mongoose.connection.close()
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
