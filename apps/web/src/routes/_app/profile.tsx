import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/profile"!</div>
}
