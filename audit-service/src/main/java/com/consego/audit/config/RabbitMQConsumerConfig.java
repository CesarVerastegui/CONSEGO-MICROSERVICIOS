package com.consego.audit.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConsumerConfig {

    public static final String EXCHANGE_NAME = "consego.events.tx";
    public static final String QUEUE_NAME = "consego.audit.queue";
    public static final String ROUTING_KEY_PATTERN = "#";

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

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
