const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
//Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
//Exporter
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");

module.exports = (serviceName) => {
   const jaegerExporter = new JaegerExporter({
      serviceName: serviceName,
      // Additional Jaeger options if needed
      // endpoint: 'http://jaeger-collector:14268/api/traces',
      // processName: 'my-process',
   });

   const provider = new NodeTracerProvider({
      resource: new Resource({
         [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      }),
   });

   provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
   provider.register();

   registerInstrumentations({
      instrumentations: [
         new HttpInstrumentation(),
         new ExpressInstrumentation(),
         new MongoDBInstrumentation(),
      ],
      tracerProvider: provider,
   });

   return trace.getTracer(serviceName);
};
