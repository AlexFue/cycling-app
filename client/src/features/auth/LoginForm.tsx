import Messages from '../../en.json'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const LoginForm: React.FC = () => {
  return (
    <form>
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel
              htmlFor="email"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              {Messages.login.email}
            </FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder={Messages.placeholders.email}
            />
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel
                htmlFor="password"
                className="text-xs uppercase tracking-wide text-muted-foreground"
              >
                {Messages.login.password}
              </FieldLabel>
              <a
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                {Messages.login.forgotPassword}
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder={Messages.placeholders.password}
            />
          </Field>

          <Button type="submit" className="h-11 w-full px-4 py-2.5">
            {Messages.login.loginButton}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {Messages.login.newHere}{' '}
            <a href="/signup" className="text-sm text-primary hover:underline">
              {Messages.login.createAccount}
            </a>
          </p>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}

export default LoginForm
