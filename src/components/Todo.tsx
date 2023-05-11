import toast from "react-hot-toast"
import type { Todo } from "../types"
import { api } from "../utils/api"

type TodoProps = {
	todo: Todo
}

export default function Todo({ todo }: TodoProps) {
	const { id, text, done } = todo

	const trpc = api.useContext()

	const { mutate: doneMutation } = api.todo.toggle.useMutation({
		onMutate: async ({ id, done }) => {

			// Cancel any outgoing refetches so they don't overwrite our optimistic update
			await trpc.todo.all.cancel()

			// Snapshot the previous value
			const previousTodos = trpc.todo.all.getData()

			// Optimistically update to the noe value
			trpc.todo.all.setData(undefined, (prev) => {
				if (!prev) return previousTodos
				return prev.map(t => {
					if (t.id === id) {
						return ({
							...t,
							done
						})
					}
					return t
				})
			})


			return ({ previousTodos })
		},
		onSuccess: (err, { done }) => {
			if (done) {
				toast.success('Todo completed 🎉')
			}
		},

		onError: (err, newTodo, context) => {
			toast.error(`An error occured when setting todo to ${done ? 'done' : 'undone'}`)
			trpc.todo.all.setData(undefined, () => context?.previousTodos)
		},
		onSettled: async () => {
			await trpc.todo.all.invalidate()
		}
	})

	const { mutate: deleteMutation } = api.todo.delete.useMutation({
		onMutate: async (deleteId) => {

			// Cancel any outgoing refetches so they don't overwrite our optimistic update
			await trpc.todo.all.cancel()

			// Snapshot the previous value
			const previousTodos = trpc.todo.all.getData()

			// Optimistically update to the noe value
			trpc.todo.all.setData(undefined, (prev) => {
				if (!prev) return previousTodos
				return prev.filter(t => t.id !== deleteId)
			})


			return ({ previousTodos })
		},

		onError: (err, newTodo, context) => {
			toast.error('An error occures when deleting todo')
			trpc.todo.all.setData(undefined, () => context?.previousTodos)
		},
		onSettled: async () => {
			await trpc.todo.all.invalidate()
		}
	})

	return (
		<>
			<div
				className="flex gap-2 items-center justify-between"
			>
				<div className="flex gap-2 items-center label cursor-pointer">
					<input
						className="checkbox checkbox-primary"
						type="checkbox" name="done" id={id}
						checked={done}
						onChange={(e) => {
							doneMutation({ id, done: e.target.checked })
						}}
					/>
					<label htmlFor={id} className={`label-text ${done ? 'line-through' : ''}`}>
						{text}
					</label>
				</div>
				<button
					className="btn btn-error"
					onClick={() => {
						deleteMutation(id)
					}}
				>Delete</button>
			</div>
		</>
	)
}