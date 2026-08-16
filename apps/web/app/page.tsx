import Editor from '@/components/Editor'
import ConnectionStatus from '@/components/ConnectionStatus'

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">InkSync</h1>
      <ConnectionStatus />
      <Editor />
    </main>
  )
}
