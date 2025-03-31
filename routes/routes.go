package routes

import (
	"attendance-go-app/controllers"
	"attendance-go-app/dto"
	"attendance-go-app/middlewares"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	// app.Get("/", controllers.LoginView)
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Welcome to the Attendance App API!")
	})
	api := app.Group("/api")

	auth := api.Group("/auth")

	auth.Post("/login", middlewares.ValidateBody[dto.UserLoginDTO](), controllers.Login)
	auth.Post("/logout", middlewares.AuthMiddleware, controllers.Logout)

	api.Use(middlewares.AuthMiddleware)
	api.Get("/users", controllers.GetUsers)
	api.Post("/users", controllers.Register)
	api.Get("/users/activity", controllers.GetActivities)

}
