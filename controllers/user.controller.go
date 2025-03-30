package controllers

import (
	"attendance-go-app/config"
	"attendance-go-app/models"
	"context"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetUsers(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	usersCollection := config.DB.Collection("users")

	// Find all users
	cursor, err := usersCollection.Find(ctx, bson.M{})
	if err != nil {
		log.Println("Error fetching users:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Internal Server Error"})
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err := cursor.All(ctx, &users); err != nil {
		log.Println("Error decoding users:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Internal Server Error"})
	}

	return c.JSON(users)
}

func GetActivities(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	activitiesCollection := config.DB.Collection("activity")

	// Find all activities
	cursor, err := activitiesCollection.Find(ctx, bson.M{})
	if err != nil {
		log.Println("Error fetching activities:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Internal Server Error"})
	}
	defer cursor.Close(ctx)

	var activity []models.Activity
	if err := cursor.All(ctx, &activity); err != nil {
		log.Println("Error decoding activities:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Internal Server Error"})
	}

	// Add user details to each activity use aggregation pipeline
	// pipeline := mongo.Pipeline{
	// 	{{"$lookup", bson.D{
	// 		{"from", "users"},
	// 		{"localField", "user_id"},
	// 		{"foreignField", "_id"},
	// 		{"as", "user"},
	// 	}}},
	// 	{{"$project", bson.D{
	// 		{"user.password", 0}, // Exclude password
	// 		{"user_id", 0},       // Exclude user_id
	// 	}}},
	// 	{{"$unwind", bson.D{{"path", "$user"}, {"preserveNullAndEmptyArrays", true}}}},
	// }

	pipeline2 := mongo.Pipeline{
		bson.D{{
			Key: "$lookup", Value: bson.D{
				{Key: "from", Value: "users"},
				{Key: "localField", Value: "user_id"},
				{Key: "foreignField", Value: "_id"},
				{Key: "as", Value: "user"},
			},
		}},
		bson.D{{
			Key: "$project", Value: bson.D{
				{Key: "user.password", Value: 0}, // Exclude password
				{Key: "user_id", Value: 0},       // Exclude user_id
			},
		}},
		bson.D{{
			Key: "$unwind", Value: bson.D{
				{Key: "path", Value: "$user"},
				{Key: "preserveNullAndEmptyArrays", Value: true},
			},
		}},
		bson.D{{
			Key: "$sort", Value: bson.D{
				{Key: "created_at", Value: -1}, // Sorting in descending order
			},
		}},
	}

	// Execute Aggregation Query
	cursor2, err := activitiesCollection.Aggregate(ctx, pipeline2)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch products"})
	}

	var activities []bson.M
	if err := cursor2.All(ctx, &activities); err != nil {
		log.Println("Error decoding activities:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to decode products"})
	}

	// // ✅ Debugging
	// log.Println("Total activities returned:", len(activities))

	data := map[string]interface{}{
		"activities": activities,
	}

	return c.JSON(data)
}
