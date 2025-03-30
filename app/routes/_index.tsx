import { type ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  redirect,
  // redirect,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import { login } from "api/api";
import { authCookie } from "~/cookies.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Login | Attendance" },
    { name: "description", content: "Welcome to Attendance System!" },
  ];
};

export async function loader({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader?.includes("auth")) {
    return redirect("/dashboard");
  }
  return {
    status: 200,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.formData();
    const email = body.get("email");
    const password = body.get("password");

    console.log("Email:", email); // Debugging line
    console.log("Password:", password); // Debugging line

    const errors: { email?: string; password?: string } = {};

    // Basic Validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      errors.email = "Please enter a valid email address.";
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    if (Object.keys(errors).length > 0) {
      return new Response(JSON.stringify({ errors }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Simulate login (replace with actual login logic)
    const res = await login({
      email: email as string,
      password: password as string,
      request,
    });

    if (res) {
      if (res.error) {
        errors.email = res.error;
        return new Response(JSON.stringify({ errors }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      if (res.token) {
        console.log("Login successful:", res.token); // Debugging line
        return redirect("/dashboard", {
          headers: {
            "Set-Cookie": await authCookie.serialize(res.token, {
              encode: (c) => atob(c),
              httpOnly: true,
              secure: true,
            }),
          },
        });
      }
    }

    errors.email = "Something went wrong. Please try again later.";
    return new Response(JSON.stringify({ errors }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Action error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export default function Index() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  // **Determine if the form is submitting**
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-10 w-auto"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <Form
        className="mt-10 space-y-6 sm:mx-auto sm:w-full sm:max-w-sm"
        method="post"
      >
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900"
          >
            Email address
          </label>
          <div className="mt-2">
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 sm:text-sm"
            />
          </div>
          {actionData?.errors?.email && (
            <p className="mt-1 text-sm text-red-600">
              {actionData.errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900"
            >
              Password
            </label>
            <div className="text-sm">
              <Link
                to="#"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <div className="mt-2">
            <input
              type="password"
              name="password"
              id="password"
              autoComplete="current-password"
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 sm:text-sm"
            />
          </div>
          {actionData?.errors?.password && (
            <p className="mt-1 text-sm text-red-600">
              {actionData.errors.password}
            </p>
          )}
        </div>

        {/* Submit Button with Loading State */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 
              ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </div>

        {actionData?.error && (
          <div className="text-red-600">{actionData.error}</div>
        )}
      </Form>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <p className="text-center text-sm text-gray-500">
          Not a member?{" "}
          <Link
            to="#"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
