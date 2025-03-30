package main

import (
	"attendance-go-app/config"
	"attendance-go-app/routes"

	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	config.ConnectDB()

	// app.Get("/swagger/*", swagger.HandlerDefault)

	routes.SetupRoutes(app)

	app.Listen(":4000")
}
