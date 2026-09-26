package ru.tramforecast.api.web;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.IntegerSchema;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.ObjectSchema;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import java.util.Map;
import java.util.Set;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Metadata of the generated OpenAPI document. The document itself is derived from the
 * controllers; the committed copy in {@code docs/openapi.json} is verified against it by a test,
 * so the contract cannot drift from the code.
 */
@Configuration
public class OpenApiConfig {

    private static final String PROBLEM = "Problem";
    private static final String PROBLEM_JSON = "application/problem+json";

    /** Handlers that read forecasts and can therefore be answered with 503 when nothing is stored. */
    private static final Set<String> READS_FORECASTS =
            Set.of("routes", "routeForecast", "stopForecast", "attention", "export");

    /** Handlers addressing a specific route or stop, which can be unknown. */
    private static final Set<String> ADDRESSES_ROUTE =
            Set.of("routeForecast", "stopForecast", "loadMatrix", "export");

    /**
     * The document header: title, conventions every client needs, and a fixed server entry so the
     * exported file does not depend on the port it was generated on.
     *
     * @return the OpenAPI header
     */
    @Bean
    public OpenAPI tramForecastOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Tram forecast API")
                        .version("0.1.0")
                        .description("""
                                Forecast of tram ridership by route and stop for the horizons day, week, month and year.

                                **Conventions**
                                - Timestamps are ISO 8601 with an explicit offset, for example
                                  `2026-09-25T09:00:00+03:00`. Dates are `YYYY-MM-DD`. There are no unix timestamps.
                                - Every forecast response carries the whole horizon, so a time slider on the client
                                  reads points locally and needs no further requests.
                                - Steps follow the horizon: day = hourly, week = daily, month = daily, year = monthly. A week is
                                  seven days starting at the requested `date` (not a calendar week).
                                - Routes and stops are identified by opaque string IDs; geometry is not served.
                                - `modelVersion = "stub"` and `dataSource = "stub"` mean synthetic demo data.
                                - Errors are RFC 9457 problem documents (`application/problem+json`).
                                - When access control is on, every `/api/**` request needs the header
                                  `Authorization: Basic base64(user:password)`; there is no login endpoint.
                                  A missing or wrong credential gives 401 (no `WWW-Authenticate` header).
                                """)
                        .license(new License().name("MIT").url("https://opensource.org/licenses/MIT")))
                .components(new Components().addSecuritySchemes(
                        "basicAuth", new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("basic")))
                .addSecurityItem(new SecurityRequirement().addList("basicAuth"))
                .addServersItem(new Server().url("http://localhost:8080").description("Local backend"));
    }

    /**
     * Registers the shape of an error response.
     *
     * @return the customizer that adds the {@code Problem} schema
     */
    @Bean
    public OpenApiCustomizer problemSchema() {
        return openApi -> {
            if (openApi.getComponents() == null) {
                openApi.setComponents(new Components());
            }
            openApi.getComponents().addSchemas(PROBLEM, new ObjectSchema()
                    .description("RFC 9457 problem document")
                    .addProperty("type", new StringSchema().example("about:blank"))
                    .addProperty("title", new StringSchema().example("Invalid parameter"))
                    .addProperty("status", new IntegerSchema().example(400))
                    .addProperty("code", errorCodes())
                    .addProperty("timestamp", new StringSchema()
                            .description("When the error happened, ISO 8601 with an explicit offset")
                            .example("2026-09-26T13:20:11.123+03:00"))
                    .addProperty("detail", new StringSchema()
                            .description("A message that can be shown to the user")
                            .example("One of the request parameters is missing or has the wrong format."))
                    .addProperty("instance", new StringSchema().example("/api/routes")));
        };
    }

    private static StringSchema errorCodes() {
        StringSchema code = new StringSchema();
        code.setDescription("Machine-readable error code, stable across releases (codes are added, never renamed)");
        code.setExample(ErrorCode.ROUTE_NOT_FOUND.name());
        for (ErrorCode value : ErrorCode.values()) {
            code.addEnumItem(value.name());
        }
        return code;
    }

    /**
     * Adds the error responses each endpoint can produce, leaving the success response to be
     * inferred from the method's return type.
     *
     * @return the operation customizer
     */
    @Bean
    public OperationCustomizer problemResponses() {
        return (operation, handlerMethod) -> {
            String handler = handlerMethod.getMethod().getName();
            addProblem(operation.getResponses(), "401",
                    "Missing or invalid Authorization: Basic header (only when access control is on)");
            if (!"meta".equals(handler)) {
                addProblem(operation.getResponses(), "400", "Invalid parameter or request");
            }
            if (ADDRESSES_ROUTE.contains(handler)) {
                addProblem(operation.getResponses(), "404", "Unknown route or stop, or nothing to return for them");
            }
            if (READS_FORECASTS.contains(handler)) {
                addProblem(operation.getResponses(), "503",
                        "No forecast is stored for the request and the ML service is unavailable");
            }
            return operation;
        };
    }

    private static void addProblem(io.swagger.v3.oas.models.responses.ApiResponses responses, String code, String description) {
        Schema<?> ref = new Schema<>().$ref("#/components/schemas/" + PROBLEM);
        responses.addApiResponse(code, new ApiResponse()
                .description(description)
                .content(new Content().addMediaType(PROBLEM_JSON, new MediaType().schema(ref))));
    }
}
