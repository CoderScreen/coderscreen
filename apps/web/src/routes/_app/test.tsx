import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/test')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/test"!</div>
}
