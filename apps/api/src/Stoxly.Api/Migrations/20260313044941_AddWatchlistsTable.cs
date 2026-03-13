using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stoxly.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddWatchlistsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddUniqueConstraint(
                name: "AK_symbols_symbol",
                table: "symbols",
                column: "symbol");

            migrationBuilder.CreateTable(
                name: "watchlists",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    ticker = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_watchlists", x => x.id);
                    table.ForeignKey(
                        name: "FK_watchlists_symbols_ticker",
                        column: x => x.ticker,
                        principalTable: "symbols",
                        principalColumn: "symbol",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_watchlists_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "firebase_uid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_watchlists_ticker",
                table: "watchlists",
                column: "ticker");

            migrationBuilder.CreateIndex(
                name: "IX_watchlists_user_id",
                table: "watchlists",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_watchlists_user_id_ticker",
                table: "watchlists",
                columns: new[] { "user_id", "ticker" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "watchlists");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_symbols_symbol",
                table: "symbols");
        }
    }
}
