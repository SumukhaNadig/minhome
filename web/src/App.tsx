import { Routes, Route, Navigate } from 'react-router-dom'
import { TransactionsList } from './pages/TransactionsList'
import { TransactionDetail } from './pages/TransactionDetail'
import { TaskDefinitionsList } from './pages/TaskDefinitionsList'
import { TaskDefinitionForm } from './pages/TaskDefinitionForm'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/transactions" replace />} />
      <Route path="/transactions" element={<TransactionsList />} />
      <Route path="/transactions/:id" element={<TransactionDetail />} />
      <Route path="/transactions/:id/audit-log" element={<TransactionDetail />} />
      <Route path="/transactions/:id/notes" element={<TransactionDetail />} />
      <Route path="/task-definitions" element={<TaskDefinitionsList />} />
      <Route path="/task-definitions/new" element={<TaskDefinitionForm />} />
      <Route path="/task-definitions/:id" element={<TaskDefinitionForm />} />
      <Route path="*" element={<div>Not found</div>} />
    </Routes>
  )
}
