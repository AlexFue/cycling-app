import Messages from '../../en.json'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

const LoginForm: React.FC = () => {
  return (
    <form>
      <FieldSet>
        <FieldGroup className="**:data-[slot=input]:h-11">
          <Field>
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
            />
          </Field>

          <Field>
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
              type="password"
              placeholder={Messages.placeholders.password}
            />
          </Field>

          <Button type="submit" className="h-11 w-full px-4 py-2.5">
            {Messages.auth.login.loginButton}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {Messages.auth.login.newHere}{' '}
            <Link to="/signup" className="text-sm text-primary hover:underline">
              {Messages.auth.login.createAccount}
            </Link>
          </p>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}

export default LoginForm
