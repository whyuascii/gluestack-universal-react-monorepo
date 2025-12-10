# Service Contracts

The service contracts package is a crucial component in our application architecture that defines the contracts between different services, such as the React frontend and the Node.js webserver. These contracts ensure that the services communicate with each other using well-defined and agreed-upon data structures and APIs.

## Purpose

The main purpose of the service contracts package is to establish a clear and consistent interface between services. By defining the contracts, we can achieve the following benefits:

1. **Type Safety**: The service contracts package leverages Zod, a TypeScript-first schema declaration and validation library. Zod allows us to define the shapes of the objects that are exchanged between services. This provides strong type safety and ensures that the data being sent and received adheres to the expected structure.

2. **Data Validation**: With Zod, we can define validation rules for the data being exchanged. This includes specifying required fields, data types, constraints, and more. By validating the data against the defined contracts, we can catch and handle any discrepancies or errors early in the communication process.

3. **API Documentation**: The service contracts serve as a form of API documentation. They clearly define the expected input and output of each service endpoint. This makes it easier for developers to understand how to interact with the services and helps maintain consistency across the application.

4. **Decoupling**: By defining the contracts between services, we decouple the implementation details of each service. The services can evolve independently as long as they adhere to the defined contracts. This allows for flexibility in choosing the technologies and frameworks used within each service.

## Contract Definition

The service contracts are defined using Zod schemas. Each contract represents a specific data structure or API endpoint. Here's an example of how a contract can be defined using Zod:

```typescript
import { z } from "zod";

const GetUsersRequest = z.object({
    id: z.string(),
    name: z.string().min(2).max(50),
    email: z.string().email(),
    age: z.number().min(18).max(120),
});

type User = z.infer<typeof GetUsersRequest>;
```

In this example, we define a contract for a user object. The `GetUsersRequest` is a Zod schema that specifies the shape and validation rules for the user data. It includes fields such as `id`, `name` (a string with length constraints), `email` (a valid email string), and `age` (a number with minimum and maximum values).

By using `z.infer<typeof GetUsersRequest>`, we can create a corresponding TypeScript type `User` that represents the shape of the user object. This type can be used throughout the codebase to ensure type safety and consistency.

## Usage

The service contracts package is used in the following ways:

1. **Request/Response Validation**: When a service receives a request, it can validate the incoming data against the defined contract using Zod. If the data does not match the expected schema, an error can be thrown or an appropriate response can be sent back to the client. Additonally with transforms the incoming data can be coerced into the correct type, such as when converting certain properties of a JSON response to be a Date or ObjectId.
    - Validation and parsing can be done with the `parse` or `safeParse` function from the exported zod object.
        - **Unfortunately the React App currently cannot make use of the parsing functions, only the TS types can be used.**

2. **API Documentation**: The service contracts can be used to generate API documentation automatically. Tools like Swagger can leverage the Zod schemas to create interactive documentation that describes the available endpoints, their input and output structures, and any validation rules.

3. **Client-Side Type Generation**: The service contracts can be used to generate TypeScript types for the client-side code (e.g., the React frontend). By sharing the Zod schemas between the server and the client, we can ensure that both sides have a consistent understanding of the data structures being exchanged.
    - ObjectIds do not belong in the UI, therefore the service-contract type you use in the UI must be stripped of ObjectIds. This is done by using the `ConvertObjectIdToString` TypeScript utility function from `utils`.

4. **Data Transformation**: The service contracts can be used to transform the data as part of validation. Zod provides utility functions for preprocessing or postprocessing the data, such as `transform`, `default`, `refine`. These functions can be used to manipulate the data according to specific requirements.

5. **Testing**: The service contracts can be used to create test cases that verify the correctness of the data being sent and received between services. By validating the data against the contracts, we can catch any discrepancies or errors during testing.

## Best Practices

1. **Nullish for Optional or Nullable Fields**: If a field can be nullable and optional, use Zod’s `nullish` method. This ensures that fields can be either `null`, `undefined`, or a specified type.

2. **Defaults Everywhere**: Define default values for fields whenever possible, unless a missing value should explicitly cause an error. This reduces the likelihood of runtime issues due to missing fields. This does not replace the need of `.nullable()`

3. **Non-Optional Responses**: Response schemas should not include optional fields. All responses should have a consistent structure and provide default values where needed.

4. **Keep Contracts Separate**: Store the service contracts in a separate package or directory within the codebase. This keeps them independent of the implementation details of each service and allows for easy sharing and reuse across different parts of the application.

5. **Use Meaningful Names**: Choose clear and descriptive names for the contracts and their fields. This makes the contracts more readable and self-explanatory. General naming conventions should follow `<Method><Service><Path><Request/Response>`, for example, `GetUsersRequest`, `GetUsersResponse`, or `PostAutoflowPreviewResponse`.

6. **Validate Early**: Validate the data against the contracts as early as possible in the communication process. This helps catch errors and inconsistencies before they propagate further into the system.

7. **Document the Contracts**: Provide clear documentation for each contract, explaining its purpose, fields, and any specific validation rules or constraints. This helps developers understand and use the contracts effectively.

8. **Zod Transforms**: Try not to use Transforms on responses as it can be confusing to the consumer of the API. If you need to transform data, consider doing it in the service that is consuming the API. Additionally if a transform is needed, ensure its isomorphic, so front-end and back-end can use the same type. These can be found in the `utils-isomorphic` package.
