import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import Messages from '../../en.json'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { signUpSchema, type SignUpRequest } from 'shared'
import { useSignUp } from './hooks/useSignUp'

const SignUpForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpRequest>({
    resolver: zodResolver(signUpSchema),
  })

  const { mutate, isPending, error } = useSignUp()

  const onSubmit = (data: SignUpRequest) => {
    mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldSet>
        <FieldGroup className="**:data-[slot=input]:h-11">
          <Field data-invalid={!!errors.username}>
            <FieldLabel
              htmlFor="username"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              {Messages.auth.signUp.username}
            </FieldLabel>
            <Input
              id="username"
              placeholder={Messages.placeholders.username}
              aria-invalid={!!errors.username}
              {...register('username')}
            />
            <FieldError errors={[errors.username]} />
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel
              htmlFor="email"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              {Messages.auth.email}
            </FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder={Messages.placeholders.email}
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel
              htmlFor="password"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              {Messages.auth.password}
            </FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder={Messages.placeholders.password}
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          {error && <p className="text-sm text-destructive">{error.message}</p>}

          <Button
            type="submit"
            disabled={isPending}
            className="h-11 w-full px-4 py-2.5"
          >
            {isPending ? '...' : Messages.auth.signUp.createAccount}
          </Button>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}

export default SignUpForm
