package ru.tramforecast.api.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.Architectures.layeredArchitecture;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/**
 * Enforces the hexagonal layer boundaries as build-breaking rules, so a framework or
 * infrastructure dependency cannot leak into the inner layers.
 */
@AnalyzeClasses(packages = "ru.tramforecast.api", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

    /**
     * Domain is used by everyone, application by infrastructure and web, and nothing depends on
     * infrastructure or web.
     */
    @ArchTest
    static final ArchRule layersRespectHexagonalBoundaries = layeredArchitecture()
            .consideringOnlyDependenciesInLayers()
            .layer("Domain").definedBy("..domain..")
            .layer("Application").definedBy("..application..")
            .layer("Infrastructure").definedBy("..infrastructure..")
            .layer("Web").definedBy("..web..")
            .whereLayer("Domain").mayOnlyBeAccessedByLayers("Application", "Infrastructure", "Web")
            .whereLayer("Application").mayOnlyBeAccessedByLayers("Infrastructure", "Web")
            .whereLayer("Infrastructure").mayNotBeAccessedByAnyLayer()
            .whereLayer("Web").mayNotBeAccessedByAnyLayer();

    /**
     * Domain classes must not import Spring or Jakarta types.
     */
    @ArchTest
    static final ArchRule domainShouldNotDependOnFrameworks = noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAnyPackage("org.springframework..", "jakarta..");

    /**
     * Application classes must stay free of Spring: wiring lives in infrastructure configuration.
     */
    @ArchTest
    static final ArchRule applicationShouldNotDependOnSpring = noClasses()
            .that().resideInAPackage("..application..")
            .should().dependOnClassesThat().resideInAnyPackage("org.springframework..", "jakarta..");

    /**
     * Domain classes must not import application, infrastructure or web types.
     */
    @ArchTest
    static final ArchRule domainShouldNotDependOnOuterLayers = noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAnyPackage("..application..", "..infrastructure..", "..web..");
}
