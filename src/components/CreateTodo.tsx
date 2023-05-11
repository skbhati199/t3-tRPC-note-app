import { useState } from "react"
import { api } from "../utils/api"
import { toast } from "react-hot-toast"
import { todoInput } from "~/types"

export default function CreateTodo() {
	const [newTodo, setNewTodo] = useState('')

	const trpc = api.useContext()

	const { mutate } = api.todo.create.useMutation({
		onMutate: async (newTodo) => {

			// Cancel any outgoing refetches so they don't overwrite our optimistic update
			await trpc.todo.all.cancel()

			// Snapshot the previous value
			const previousTodos = trpc.todo.all.getData()

			// Optimistically update to the noe value
			trpc.todo.all.setData(undefined, (prev) => {
				const optimisticTodo = {
					id: 'optimistic-todo-id',
					text: newTodo,
					done: false
				}
				if (!prev) return [optimisticTodo]
				return [...prev, optimisticTodo]
			})

			setNewTodo('')

			return ({ previousTodos })
		},

		onError: (err, newTodo, context) => {
			toast.error('An error occures when creating todo')
			setNewTodo(newTodo)
			trpc.todo.all.setData(undefined, () => context?.previousTodos)
		},

		onSettled: async () => {
			await trpc.todo.all.invalidate()
		}
	})

	return (
		<div>
			<form
				onSubmit={(e) => {
					e.preventDefault()

					const result = todoInput.safeParse(newTodo)

					if (!result.success) {
						toast.error(result.error.format()._errors.join('\n'))
						return
					}

					// Create todo mutation
					mutate(newTodo)
				}}
				className="flex gap-2">
				<input
					className="input input-bordered input-primary w-full max-w-xs"
					placeholder="New Todo..."
					type="text" name="new-todo" id="new-todo"
					value={newTodo}
					onChange={(e) => {
						setNewTodo(e.target.value)
					}}
				/>
				<button
					className="btn btn-primary"
				>Create</button>
			</form>
		</div >
	)
}