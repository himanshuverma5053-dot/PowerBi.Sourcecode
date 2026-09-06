/**
 * AWS Lambda Function Handler for Magadh Tyres Profile Synchronization
 *
 * Integrated with:
 * - Amazon API Gateway (REST or HTTP API with CORS)
 * - Amazon DynamoDB (Table: magadh_tyres_customers / CustomerProfiles)
 *
 * Incoming POST Body format (application/json):
 * {
 *   "username": "Himanshu Verma",
 *   "contact_number": "+91 9876543210",
 *   "email_address": "user@example.com",
 *   "GSTIN": "21AAACM1234F1Z5",
 *   "workshop_address": "Plot 12, Industrial Area, Patna - 800001"
 * }
 */

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_NAME = process.env.CUSTOMER_PROFILES_TABLE || process.env.TABLE_NAME || "magadh_tyres_customers";

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Standard CORS response headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key,X-Amz-Date,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  "Content-Type": "application/json"
};

exports.handler = async (event) => {
  console.log("Lambda received event:", JSON.stringify(event, null, 2));

  // 1. Handle CORS Preflight OPTIONS requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "CORS preflight OK" })
    };
  }

  // 2. Enforce POST method
  if (event.httpMethod && event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: `Method ${event.httpMethod} Not Allowed. Expected POST.` })
    };
  }

  try {
    let body = {};
    if (typeof event.body === "string") {
      body = JSON.parse(event.body);
    } else if (event.body) {
      body = event.body;
    } else {
      body = event;
    }

    // Extract exact 5 required keys
    const {
      username = "",
      contact_number = "",
      email_address = "",
      GSTIN = "",
      workshop_address = ""
    } = body;

    console.log("Extracted profile details:", {
      username,
      contact_number,
      email_address,
      GSTIN,
      workshop_address
    });

    // Generate unique partition key (email or username)
    const partitionKey = (email_address || username || `user_${Date.now()}`).toLowerCase().trim();
    const timestamp = new Date().toISOString();

    const dynamoItem = {
      id: partitionKey,
      customer_id: partitionKey,
      username: String(username).trim(),
      contact_number: String(contact_number).trim(),
      email_address: String(email_address).trim(),
      GSTIN: String(GSTIN).trim().toUpperCase(),
      workshop_address: String(workshop_address).trim(),
      updatedAt: timestamp
    };

    // Persist to DynamoDB
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: dynamoItem
    }));

    console.log(`Successfully persisted customer ${partitionKey} to DynamoDB table ${TABLE_NAME}`);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        message: "Profile updated and persisted successfully to DynamoDB!",
        data: dynamoItem
      })
    };
  } catch (error) {
    console.error("Error executing Lambda handler:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        error: "Internal Server Error",
        message: error.message || "Failed to save profile to DynamoDB"
      })
    };
  }
};
