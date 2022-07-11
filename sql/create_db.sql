USE discord_bot

IF OBJECT_ID('music_request_user_data', 'U') IS NOT NULL
DROP TABLE dbo.Customers

GO

CREATE TABLE music_request_user_data
(
    UserId INT PRIMARY KEY,
    Username VARCHAR(128) NOT NULL,
    Discriminator INT NOT NULL,
    Requests INT NOT NULL
);

GO

