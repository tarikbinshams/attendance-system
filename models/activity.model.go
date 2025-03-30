package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Activity struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Type      string             `bson:"type" json:"type"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	CreatedAt primitive.DateTime `bson:"created_at" json:"created_at"`
	UpdatedAt primitive.DateTime `bson:"updated_at" json:"updated_at"`
}
