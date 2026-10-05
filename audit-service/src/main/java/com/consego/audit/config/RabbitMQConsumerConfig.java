package com.consego.audit.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de RabbitMQ para el microservicio consumidor (audit-service).
 * Configura la serialización y deserialización JSON mediante Jackson2JsonMessageConverter
 * e infraestructura de TopicExchange y Queue según la rúbrica oficial.
 */
@Configuration
public class RabbitMQConsumerConfig {

    public static final String EXCHANGE_NAME = "consego.events.tx";
    public static final String QUEUE_NAME = "consego.audit.queue";
    public static final String ROUTING_KEY_PATTERN = "solicitud.#";

    @Bean
    public TopicExchange consegoEventsExchange() {
        return new TopicExchange(EXCHANGE_NAME, true, false);
    }

    @Bean
    public Queue consegoAuditQueue() {
        return new Queue(QUEUE_NAME, true);
    }

    @Bean
    public Binding consegoAuditBinding(Queue consegoAuditQueue, TopicExchange consegoEventsExchange) {
        return BindingBuilder.bind(consegoAuditQueue)
                .to(consegoEventsExchange)
                .with(ROUTING_KEY_PATTERN);
    }

    /**
     * Bean requerido para deserializar los mensajes JSON provenientes de RabbitMQ.
     */
    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
