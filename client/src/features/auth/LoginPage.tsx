import { Bike } from 'lucide-react'
import Messages from '../../en.json'
import LoginForm from './LoginForm'
import ThemeToggle from '@/components/ThemeToggle'

const LoginPage: React.FC = () => {
  return (
    <div>
      <div className="float-right mr-3 mt-3">
        <ThemeToggle />
      </div>
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
              <Bike className="size-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-foreground">
                {Messages.login.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {Messages.login.subtitle}
              </p>
            </div>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
