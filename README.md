# About

This library provides several different permutations of a bare-bone server using the NestJS framework.

# Permutations

| Permutation                            | Functionalities                                                                              |
| -------------------------------------- | -------------------------------------------------------------------------------------------- |
| Minimalist                             | Environmental Variables, Swagger OpenAPI, Task Scheduler, Logging, and Key Management System |
| Minimalist w/ Bearer Auth              | **Minimalist** + Bearer Authentication                                                       |
| Minimalist w/ Database                 | **Minimalist** + MongoDB                                                                     |
| Minimalist w/ Database and JWT Auth    | **Minimalist w/ Database** + JSON Web Token Authentication                                   |
| Minimalist w/ Database and Bearer Auth | **Minimalist w/ Database** + Bearer Authentication                                           |

# Decision Flow

```mermaid
flowchart TD
    A[Start] --> B[Do you need\nauthentication for\n your APIs?]
    B --> |No| C1[Do you need a database?]
    B --> |Yes| C2[Do you need a database?]
    C1 --> |No| D1[Minimalist]
    C1 --> |Yes| D2[Minimalist\nw/ Database]
    C2 --> |No| D3[Minimalist\nw/ Bearer Auth]
    C2 --> |Yes| D4[Which authentication\nmethod would you prefer?]
    D4 --> |JWT| E1[Minimalist\nw/ Database\nand JWT Auth]
    D4 --> |Bearer| E2[Minimalist\nw/ Database\nand Bearer Auth]
    style D1 fill:#f9f
    style D2 fill:#f9f
    style D3 fill:#f9f
    style E1 fill:#f9f
    style E2 fill:#f9f
```

# Update

## Repository

If there is a need to conduct an upgrade to the different NestJS setups, it is easier to upgrade them in sequence.

1. Upgrade the **Minimalist** permutation
2. Using the **Minimalist** repository and follow the guide to add Bearer Auth
3. Using the **Minimalist** repository and follow the guide to add MongoDB
4. Using the **Minimalist w/ Database** repository and follow the guide to add JWT Auth
5. Using the **Minimalist w/ Database** repository and follow the guide to add Bearer Auth

## Guides `md` files

When updating the `md` files, they should be amended in the `guides` folder. After amendment, run `npm run copy-guides` to copy the necessary files to the different NestJS permutations folders.

| Permutation                            | Guides                                            |
| -------------------------------------- | ------------------------------------------------- |
| Minimalist                             | `minimalist.md`                                   |
| Minimalist w/ Bearer Auth              | `minimalist.md` + `bearer-auth.md`                |
| Minimalist w/ Database                 | `minimalist.md` + `mongodb.md`                    |
| Minimalist w/ Database and JWT Auth    | `minimalist.md` + `mongodb.md` + `jwt-auth.md`    |
| Minimalist w/ Database and Bearer Auth | `minimalist.md` + `mongodb.md` + `bearer-auth.md` |
