import Messages from '../../en.json'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { loginSchema, type LoginRequest } from 'shared'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLogin } from './hooks/useLogin'

const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  })

  const { mutate, isPending, error } = useLogin()

  const onSubmit = (data: LoginRequest) => {
    mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldSet>
        <FieldGroup className="**:data-[slot=input]:h-11">
          <Field data-invalid={!!errors.email}>
            <FieldLabel
              htmlFor="email"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              {Messages.auth.email}
            </FieldLabel>
            <Input
              id="email"
              placeholder={Messages.placeholders.email}
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <div className="flex items-center justify-between">
              <FieldLabel
                htmlFor="password"
                className="text-xs uppercase tracking-wide text-muted-foreground"
              >
                {Messages.auth.password}
              </FieldLabel>
              <Link to="/" className="text-sm text-primary hover:underline">
                {Messages.auth.login.forgotPassword}
              </Link>
            </div>
            <Input
              id="password"
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
            {isPending ? '...' : Messages.auth.login.loginButton}
          </Button>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}

export default LoginForm
