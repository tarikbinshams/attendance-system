package controllers

import (
	"attendance-go-app/config"
	"attendance-go-app/models"
	"attendance-go-app/utils"
	"context"
	"fmt"
	"log"
	"mime/multipart"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

func createToken(email string, userId primitive.ObjectID) (string, error) {
	// Create JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, config.AuthClaims{
		Email:  email,
		UserId: userId.Hex(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	})

	tokenString, err := token.SignedString(config.JwtSecret)
	if err != nil {
		fmt.Printf("Error generating token string: %v", err)
		return "", err
	}
	return tokenString, nil
}

func Login(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	usersCollection := config.DB.Collection("users")

	var credentials struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&credentials); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	var user models.User
	err := usersCollection.FindOne(ctx, bson.M{"email": credentials.Email}).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	token, err := createToken(user.Email, user.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	activityCollections := config.DB.Collection("activity")

	var activity models.Activity
	if err := c.BodyParser(&activity); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}
	activity.ID = primitive.NewObjectID()
	activity.Type = "login"
	activity.UserID = user.ID
	activity.CreatedAt = primitive.NewDateTimeFromTime(time.Now())
	activity.UpdatedAt = primitive.NewDateTimeFromTime(time.Now())

	_, err = activityCollections.InsertOne(ctx, activity)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"token": token})
}

func Register(c *fiber.Ctx) error {

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Allowed file types & max size (5MB)
	acceptedTypes := []string{"jpg", "jpeg", "png"}
	maxSize := int64(5 * 1024 * 1024) // 5MB

	var image *multipart.FileHeader

	// Check if a file was uploaded
	if file, err := c.FormFile("image"); err == nil {
		image = file
		// Validate file only if it exists
		err := utils.ValidateFile(file, acceptedTypes, maxSize)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}

		// Store file (or move to a folder)
		log.Printf("Uploaded file: %s", file.Filename)
	}

	usersCollection := config.DB.Collection("users")

	var user models.User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	// check email exists
	var existingUser models.User
	err := usersCollection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&existingUser)
	if err == nil {
		return c.Status(400).JSON(fiber.Map{"error": "Email already exists"})
	} else if err != nil && err.Error() != "mongo: no documents in result" {
		return c.Status(500).JSON(fiber.Map{"error": "Error checking email: " + err.Error()})
	}

	user.ID = primitive.NewObjectID()
	user.Status = "active"

	// If file exists, store the filename
	if image != nil {
		user.Image = image.Filename
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Could not hash password" + err.Error()})
	}
	user.Password = string(hashedPassword)

	_, err = usersCollection.InsertOne(ctx, user)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(user)
}

func Logout(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Authorization token is required"})
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	token, _ := jwt.ParseWithClaims(tokenString, &config.AuthClaims{}, func(token *jwt.Token) (interface{}, error) {
		return config.JwtSecret, nil
	})

	claims, _ := token.Claims.(*config.AuthClaims)

	activityCollections := config.DB.Collection("activity")
	var activity models.Activity

	activity.ID = primitive.NewObjectID()
	activity.Type = "logout"
	objectID, err2 := primitive.ObjectIDFromHex(claims.UserId)
	if err2 != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}
	activity.UserID = objectID
	activity.CreatedAt = primitive.NewDateTimeFromTime(time.Now())
	activity.UpdatedAt = primitive.NewDateTimeFromTime(time.Now())

	_, err := activityCollections.InsertOne(ctx, activity)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(200).JSON(fiber.Map{"message": "Logged out successfully"})

}
